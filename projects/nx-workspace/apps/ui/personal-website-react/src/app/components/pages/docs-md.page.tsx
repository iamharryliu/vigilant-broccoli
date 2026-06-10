import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { LINKS, DOCS_MD_ROUTE } from '../../core/consts/routes.const';
import { useAppContext } from '../../core/services/app-context';
import { FileTree, type FolderItem } from '../global/file-tree';
import { MarkdownPage } from '../global/markdown-page';

const STRUCTURE_URL = '/assets/md-library/md-library.json';
const DEFAULT_MD = '/assets/docs-md.md';
const FILE_PREFIX = '/assets/md-library/notes/';

const findFilepathByName = (
  item: FolderItem,
  name: string,
): string | undefined => {
  if (item.type === 'file' && item.name === name) return item.filepath;
  if (item.children) {
    for (const c of item.children) {
      const found = findFilepathByName(c, name);
      if (found) return found;
    }
  }
  return undefined;
};

const markdownFilter = (filename: string) => filename.endsWith('.md');

export function DocsMdPage() {
  const { isMobile, isBrowser } = useAppContext();
  const params = useParams<{ markdownFilename?: string }>();
  const navigate = useNavigate();
  const [root, setRoot] = useState<FolderItem | null>(null);
  const [selectedFilepath, setSelectedFilepath] = useState<string>('');
  const [isFileSelected, setFileSelected] = useState(true);

  useEffect(() => {
    fetch(STRUCTURE_URL)
      .then(r => (r.ok ? r.json() : null))
      .then(data => setRoot(data))
      .catch(() => setRoot(null));
  }, []);

  useEffect(() => {
    if (!root || !params.markdownFilename) return;
    const fp = findFilepathByName(root, `${params.markdownFilename}.md`);
    if (fp) {
      setSelectedFilepath(fp);
      setFileSelected(true);
    }
  }, [root, params.markdownFilename]);

  const currentFilepath = useMemo(
    () => (selectedFilepath ? `${FILE_PREFIX}${selectedFilepath}` : DEFAULT_MD),
    [selectedFilepath],
  );

  const onSelect = (file: FolderItem) => {
    setSelectedFilepath(file.filepath);
    setFileSelected(true);
    const stem = file.name.split('.')[0];
    navigate(`${DOCS_MD_ROUTE.path}/${stem}`);
  };

  const onClose = () => {
    setFileSelected(false);
    navigate(DOCS_MD_ROUTE.path);
  };

  const indexLink = { ...LINKS.INDEX_PAGE, text: 'Go to harryliu.dev' };

  return (
    <div className="flex">
      <div
        className={`h-screen overflow-y-auto w-full md:w-1/5 pl-3 pt-2 border-r-2 ${
          isMobile && isFileSelected ? 'hidden' : ''
        }`}
      >
        <div className="mb-2">
          <Link
            to={indexLink.url.internal ?? '/'}
            className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
          >
            {indexLink.text}
          </Link>
        </div>
        <h1
          className="text-xl font-bold mb-2 cursor-pointer"
          onClick={() => {
            setSelectedFilepath('');
            setFileSelected(true);
            navigate(DOCS_MD_ROUTE.path);
          }}
        >
          DocsMD
        </h1>
        <FileTree
          root={root}
          selectedFilepath={selectedFilepath}
          placeholder="Search .md files..."
          isTitleCase
          fileFilter={markdownFilter}
          onSelect={onSelect}
        />
      </div>
      <div
        className={`h-screen overflow-y-scroll md:block md:w-4/5 pl-4 pr-4 ${
          isMobile && !isFileSelected ? 'hidden' : ''
        }`}
      >
        <span id="section-to-print">
          {isFileSelected ? <MarkdownPage filepath={currentFilepath} /> : null}
        </span>
      </div>
      <div
        className={`absolute top-0 right-0 m-4 cursor-pointer ${
          (isMobile && !isFileSelected) || isBrowser ? 'hidden' : ''
        }`}
        onClick={onClose}
      >
        <div>X</div>
      </div>
    </div>
  );
}
