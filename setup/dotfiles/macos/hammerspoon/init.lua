require("hs.ipc")

local hyper = {"ctrl", "alt", "cmd", "shift"}
local gridCols = 3
local cellW, cellH, cellPad = 200, 125, 10
local snapshotExpirySeconds = 6
local maxWindowsPerCell = 8

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

local function windowIdToInfo(spaces)
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
    if info.w and info.h and info.w > 0 and info.h > 0 then
      map[tonumber(wid)] = {
        pid = info.pid,
        bounds = {x = info.x, y = info.y, w = info.w, h = info.h},
      }
    end
  end
  return map
end

local function spaceWindows(spaceID, idToInfo)
  local windows = {}
  for _, wid in ipairs(spaceWindowIDs(spaceID)) do
    local info = idToInfo[wid]
    local app = info and hs.application.applicationForPID(info.pid)
    if app then
      table.insert(windows, {id = wid, app = app, bounds = info.bounds})
    end
  end
  return windows
end

local snapshotCache = {}

local function windowSnapshot(wid)
  local now = hs.timer.secondsSinceEpoch()
  local cached = snapshotCache[wid]
  if cached and cached.time + snapshotExpirySeconds > now then
    return cached.image
  end
  local image = hs.window.snapshotForID(wid)
  snapshotCache[wid] = {image = image, time = now}
  return image
end

local previewCanvas = nil
local hyperWatcher = nil

local function stopHyperWatcher()
  if hyperWatcher then
    hyperWatcher:stop()
    hyperWatcher = nil
  end
end

local function closePreview()
  stopHyperWatcher()
  if previewCanvas then
    previewCanvas:delete()
    previewCanvas = nil
  end
end

local function closePreviewOnHyperRelease()
  stopHyperWatcher()
  hyperWatcher = hs.eventtap.new({hs.eventtap.event.types.flagsChanged}, function(e)
    local flags = e:getFlags()
    if not (flags.cmd and flags.ctrl and flags.alt and flags.shift) then
      closePreview()
    end
    return false
  end)
  hyperWatcher:start()
end

local function showGridPreview(activeIndex, spaces, holdSeconds)
  local rows = math.ceil(#spaces / gridCols)
  local width = gridCols * cellW + cellPad * (gridCols + 1)
  local height = rows * cellH + cellPad * (rows + 1)
  local screenFrame = hs.screen.mainScreen():frame()
  local x = screenFrame.x + (screenFrame.w - width) / 2
  local y = screenFrame.y + (screenFrame.h - height) / 2

  local elements = {}
  local function addElement(el)
    table.insert(elements, el)
  end

  addElement({
    type = "rectangle",
    action = "fill",
    fillColor = {red = 0, green = 0, blue = 0, alpha = 0.75},
    roundedRectRadii = {xRadius = 14, yRadius = 14},
  })

  local idToInfo = windowIdToInfo(spaces)

  for i, spaceID in ipairs(spaces) do
    local row = math.floor((i - 1) / gridCols)
    local col = (i - 1) % gridCols
    local cx = cellPad + col * (cellW + cellPad)
    local cy = cellPad + row * (cellH + cellPad)
    local isActive = (i == activeIndex)

    addElement({
      type = "rectangle",
      action = "fill",
      fillColor = {white = 0.15, alpha = 1},
      frame = {x = cx, y = cy, w = cellW, h = cellH},
      roundedRectRadii = {xRadius = 8, yRadius = 8},
    })

    local windows = spaceWindows(spaceID, idToInfo)

    -- Keep the largest (main content) windows when a space is over the cap;
    -- draw largest-first so smaller/foreground windows layer on top.
    table.sort(windows, function(a, b)
      return (a.bounds.w * a.bounds.h) > (b.bounds.w * b.bounds.h)
    end)
    while #windows > maxWindowsPerCell do
      table.remove(windows)
    end

    local deskAreaX, deskAreaY = cx + 6, cy + 6
    local deskAreaW, deskAreaH = cellW - 12, cellH - 32
    local scale = math.min(deskAreaW / screenFrame.w, deskAreaH / screenFrame.h)
    local deskW, deskH = screenFrame.w * scale, screenFrame.h * scale
    local deskX = deskAreaX + (deskAreaW - deskW) / 2
    local deskY = deskAreaY + (deskAreaH - deskH) / 2

    if #windows > 0 then
      addElement({
        type = "rectangle",
        action = "fill",
        fillColor = {white = 0.05, alpha = 1},
        frame = {x = deskX, y = deskY, w = deskW, h = deskH},
        roundedRectRadii = {xRadius = 4, yRadius = 4},
      })
    end

    for _, win in ipairs(windows) do
      local wx = deskX + (win.bounds.x - screenFrame.x) * scale
      local wy = deskY + (win.bounds.y - screenFrame.y) * scale
      local ww = win.bounds.w * scale
      local wh = win.bounds.h * scale
      local snapshot = windowSnapshot(win.id)
      local icon = hs.image.imageFromAppBundle(win.app:bundleID())

      if snapshot then
        addElement({
          type = "image",
          image = snapshot,
          frame = {x = wx, y = wy, w = ww, h = wh},
        })
        if icon and math.min(ww, wh) > 24 then
          local badgeSize = 14
          addElement({
            type = "image",
            image = icon,
            frame = {x = wx + ww - badgeSize - 2, y = wy + wh - badgeSize - 2, w = badgeSize, h = badgeSize},
          })
        end
      elseif icon then
        addElement({
          type = "rectangle",
          action = "fill",
          fillColor = {white = 0.1, alpha = 1},
          frame = {x = wx, y = wy, w = ww, h = wh},
        })
        local iconBoxSize = math.min(ww, wh, 24)
        addElement({
          type = "image",
          image = icon,
          frame = {x = wx + (ww - iconBoxSize) / 2, y = wy + (wh - iconBoxSize) / 2, w = iconBoxSize, h = iconBoxSize},
        })
      end
    end
    if #windows == 0 then
      addElement({
        type = "text",
        text = "empty",
        textColor = {white = 0.5, alpha = 1},
        textSize = 12,
        frame = {x = cx, y = cy + (cellH - 20) / 2 - 8, w = cellW, h = 16},
        textAlignment = "center",
      })
    end

    addElement({
      type = "rectangle",
      action = "stroke",
      strokeColor = isActive and {red = 0.3, green = 0.7, blue = 1, alpha = 1} or {white = 0.4, alpha = 1},
      strokeWidth = isActive and 3 or 1,
      fillColor = {alpha = 0},
      frame = {x = cx, y = cy, w = cellW, h = cellH},
      roundedRectRadii = {xRadius = 8, yRadius = 8},
    })

    addElement({
      type = "text",
      text = "space " .. i,
      textColor = {white = 1, alpha = 1},
      textSize = 13,
      frame = {x = cx, y = cy + cellH - 20, w = cellW, h = 18},
      textAlignment = "center",
    })
  end

  if previewCanvas then
    previewCanvas:frame({x = x, y = y, w = width, h = height})
  else
    previewCanvas = hs.canvas.new({x = x, y = y, w = width, h = height})
    previewCanvas:behavior(hs.canvas.windowBehaviors.canJoinAllSpaces + hs.canvas.windowBehaviors.stationary)
    previewCanvas:level(hs.canvas.windowLevels.overlay)
  end
  previewCanvas:replaceElements(elements)
  previewCanvas:show()
  previewCanvas:orderAbove()
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
  showGridPreview(newIndex, spaces, nil)
  closePreviewOnHyperRelease()
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
      showGridPreview(i, spaces, nil)
      closePreviewOnHyperRelease()
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
