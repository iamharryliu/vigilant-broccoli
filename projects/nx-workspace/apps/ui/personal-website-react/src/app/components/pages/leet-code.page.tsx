import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { LINKS } from '../../core/consts/routes.const';
import { useAppContext } from '../../core/services/app-context';
import { FileTree, type FolderItem } from '../global/file-tree';

const STRUCTURE_URL = '/assets/grind-75/grind-75.json';
const FILE_PREFIX = '/assets/grind-75/grind-75/';

const LANGUAGE_BY_EXT: Record<string, string> = {
  go: 'go',
  py: 'python',
  ts: 'typescript',
};

const EXT_BY_LANGUAGE: Record<string, string> = {
  go: 'go',
  python: 'py',
  typescript: 'ts',
};

const codeFilter = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase();
  return ext ? ['go', 'py', 'ts'].includes(ext) : false;
};

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

export function LeetCodePage() {
  const { isMobile, isBrowser } = useAppContext();
  const params = useParams<{ language?: string; filename?: string }>();
  const navigate = useNavigate();
  const [root, setRoot] = useState<FolderItem | null>(null);
  const [selectedFilepath, setSelectedFilepath] = useState('');
  const [content, setContent] = useState<string>('');
  const [isFileSelected, setFileSelected] = useState(false);

  useEffect(() => {
    fetch(STRUCTURE_URL)
      .then(r => (r.ok ? r.json() : null))
      .then(setRoot)
      .catch(() => setRoot(null));
  }, []);

  useEffect(() => {
    if (!root || !params.language || !params.filename) return;
    const ext = EXT_BY_LANGUAGE[params.language];
    if (!ext) return;
    const fp = findFilepathByName(root, `${params.filename}.${ext}`);
    if (fp) {
      setSelectedFilepath(fp);
      setFileSelected(true);
    }
  }, [root, params.language, params.filename]);

  useEffect(() => {
    if (!selectedFilepath) {
      setContent('');
      return;
    }
    fetch(`${FILE_PREFIX}${selectedFilepath}`)
      .then(r => (r.ok ? r.text() : ''))
      .then(setContent)
      .catch(() => setContent(''));
  }, [selectedFilepath]);

  const onSelect = (file: FolderItem) => {
    setSelectedFilepath(file.filepath);
    setFileSelected(true);
    const [stem, ext] = file.name.split('.');
    const lang = LANGUAGE_BY_EXT[ext];
    if (lang) navigate(`/grind-75/${lang}/${stem}`);
  };

  const onClose = () => {
    setFileSelected(false);
    setContent('');
  };

  const indexLink = { ...LINKS.INDEX_PAGE, text: 'Go to harryliu.dev' };

  return (
    <div className="flex">
      <div
        className={`h-screen overflow-y-scroll w-full md:w-1/4 pl-3 pt-2 border-r-2 ${
          isMobile && isFileSelected ? 'hidden' : ''
        }`}
      >
        <div className="mb-2">
          <Link
            to={indexLink.url.internal ?? '/'}
            className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
          >
            {indexLink.text}
          </Link>
        </div>
        <h1 className="text-xl font-bold mb-2">Grind 75</h1>
        <FileTree
          root={root}
          selectedFilepath={selectedFilepath}
          placeholder="Search problems..."
          fileFilter={codeFilter}
          onSelect={onSelect}
        />
      </div>
      {content ? (
        <div
          className={`h-screen overflow-y-scroll w-full md:block md:w-3/4 pl-4 pr-4 pt-4 ${
            isMobile && !isFileSelected ? 'hidden' : ''
          }`}
        >
          <code>
            <pre>{content}</pre>
          </code>
        </div>
      ) : null}
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
