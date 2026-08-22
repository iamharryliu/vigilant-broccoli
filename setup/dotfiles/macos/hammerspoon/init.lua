require("hs.ipc")

local hyper = {"ctrl", "alt", "cmd", "shift"}
local gridCols = 3
local cellW, cellH, cellPad = 200, 125, 10
local iconSize = 36

local function screenUUID()
  return hs.screen.mainScreen():getUUID()
end

local function currentIndex()
  local spaces = hs.spaces.spacesForScreen(screenUUID())
  local active = hs.spaces.activeSpaceOnScreen(screenUUID())
  for i, id in ipairs(spaces) do
    if id == active then return i, spaces end
  end
  return 1, spaces
end

local pythonBin = os.getenv("HOME") .. "/.hammerspoon-venv/bin/python3"
local windowOwnersScript = hs.configdir .. "/window_owners.py"

local function spaceWindowIDs(spaceID)
  local ok, windows = pcall(hs.spaces.windowsForSpace, spaceID)
  return (ok and windows) or {}
end

local function windowIdToPid(spaces)
  local ids = {}
  for _, spaceID in ipairs(spaces) do
    for _, wid in ipairs(spaceWindowIDs(spaceID)) do
      table.insert(ids, tostring(wid))
    end
  end
  if #ids == 0 then return {} end

  local cmd = pythonBin .. " " .. windowOwnersScript .. " " .. table.concat(ids, " ")
  local out, ok = hs.execute(cmd)
  if not ok then return {} end

  local decoded = hs.json.decode(out)
  local map = {}
  for wid, info in pairs(decoded or {}) do
    if info.name ~= "Window Server" then
      map[tonumber(wid)] = info.pid
    end
  end
  return map
end

local function spaceApps(spaceID, idToPid)
  local seen, apps = {}, {}
  for _, wid in ipairs(spaceWindowIDs(spaceID)) do
    local pid = idToPid[wid]
    local app = pid and hs.application.applicationForPID(pid)
    local bundleID = app and app:bundleID()
    if bundleID and not seen[bundleID] then
      seen[bundleID] = true
      table.insert(apps, app)
    end
  end
  return apps
end

local previewCanvas = nil

local function closePreview()
  if previewCanvas then
    previewCanvas:delete()
    previewCanvas = nil
  end
end

local function showGridPreview(activeIndex, spaces, holdSeconds)
  closePreview()
  local rows = math.ceil(#spaces / gridCols)
  local width = gridCols * cellW + cellPad * (gridCols + 1)
  local height = rows * cellH + cellPad * (rows + 1)
  local screenFrame = hs.screen.mainScreen():frame()
  local x = screenFrame.x + (screenFrame.w - width) / 2
  local y = screenFrame.y + (screenFrame.h - height) / 2

  previewCanvas = hs.canvas.new({x = x, y = y, w = width, h = height})
  previewCanvas:appendElements({
    type = "rectangle",
    action = "fill",
    fillColor = {red = 0, green = 0, blue = 0, alpha = 0.75},
    roundedRectRadii = {xRadius = 14, yRadius = 14},
  })

  local idToPid = windowIdToPid(spaces)

  for i, spaceID in ipairs(spaces) do
    local row = math.floor((i - 1) / gridCols)
    local col = (i - 1) % gridCols
    local cx = cellPad + col * (cellW + cellPad)
    local cy = cellPad + row * (cellH + cellPad)
    local isActive = (i == activeIndex)

    previewCanvas:appendElements({
      type = "rectangle",
      action = "fill",
      fillColor = {white = 0.15, alpha = 1},
      frame = {x = cx, y = cy, w = cellW, h = cellH},
      roundedRectRadii = {xRadius = 8, yRadius = 8},
    })

    local apps = spaceApps(spaceID, idToPid)
    local shown = math.min(#apps, 4)
    local iconsWidth = shown * iconSize + math.max(0, shown - 1) * 8
    local iconStartX = cx + (cellW - iconsWidth) / 2
    local iconY = cy + (cellH - 20 - iconSize) / 2
    for a = 1, shown do
      local icon = hs.image.imageFromAppBundle(apps[a]:bundleID())
      if icon then
        previewCanvas:appendElements({
          type = "image",
          image = icon,
          frame = {x = iconStartX + (a - 1) * (iconSize + 8), y = iconY, w = iconSize, h = iconSize},
        })
      end
    end
    if #apps == 0 then
      previewCanvas:appendElements({
        type = "text",
        text = "empty",
        textColor = {white = 0.5, alpha = 1},
        textSize = 12,
        frame = {x = cx, y = cy + (cellH - 20) / 2 - 8, w = cellW, h = 16},
        textAlignment = "center",
      })
    end

    previewCanvas:appendElements({
      type = "rectangle",
      action = "stroke",
      strokeColor = isActive and {red = 0.3, green = 0.7, blue = 1, alpha = 1} or {white = 0.4, alpha = 1},
      strokeWidth = isActive and 3 or 1,
      fillColor = {alpha = 0},
      frame = {x = cx, y = cy, w = cellW, h = cellH},
      roundedRectRadii = {xRadius = 8, yRadius = 8},
    })

    previewCanvas:appendElements({
      type = "text",
      text = "space " .. i,
      textColor = {white = 1, alpha = 1},
      textSize = 13,
      frame = {x = cx, y = cy + cellH - 20, w = cellW, h = 18},
      textAlignment = "center",
    })
  end

  previewCanvas:show()
  if holdSeconds then
    hs.timer.doAfter(holdSeconds, closePreview)
  end
end

local function moveGrid(dRow, dCol)
  local index, spaces = currentIndex()
  local row = math.floor((index - 1) / gridCols)
  local col = (index - 1) % gridCols
  local newCol = col + dCol
  if newCol < 0 or newCol >= gridCols then return end
  local newIndex = (row + dRow) * gridCols + newCol + 1
  if newIndex < 1 or newIndex > #spaces then return end
  hs.spaces.gotoSpace(spaces[newIndex])
  showGridPreview(newIndex, spaces, 1.2)
end

hs.hotkey.bind(hyper, "Left", function() moveGrid(0, -1) end)
hs.hotkey.bind(hyper, "Right", function() moveGrid(0, 1) end)
hs.hotkey.bind(hyper, "Up", function() moveGrid(-1, 0) end)
hs.hotkey.bind(hyper, "Down", function() moveGrid(1, 0) end)

for i = 1, 9 do
  hs.hotkey.bind(hyper, tostring(i), function()
    local _, spaces = currentIndex()
    if spaces[i] then
      hs.spaces.gotoSpace(spaces[i])
      showGridPreview(i, spaces, 1.2)
    end
  end)
end

hs.hotkey.bind(hyper, "g", function()
  if previewCanvas then
    closePreview()
    return
  end
  local index, spaces = currentIndex()
  showGridPreview(index, spaces, nil)
end)

hs.hotkey.bind(hyper, "r", function() hs.reload() end)
