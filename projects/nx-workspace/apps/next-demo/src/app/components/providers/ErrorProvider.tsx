import { AlertDialog, Button, Callout, Flex } from '@radix-ui/themes';
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from 'react';

type ErrorAlert = {
  color:
    | 'ruby'
    | 'red'
    | 'gray'
    | 'gold'
    | 'bronze'
    | 'brown'
    | 'yellow'
    | 'amber'
    | 'orange'
    | 'tomato'
    | 'crimson'
    | 'pink'
    | 'plum'
    | 'purple'
    | 'violet'
    | 'iris'
    | 'indigo'
    | 'blue'
    | 'cyan'
    | 'teal'
    | 'jade'
    | 'green'
    | 'grass'
    | 'lime'
    | 'mint'
    | 'sky'
    | undefined;
  text: string;
};

interface ContextType {
  alert: ErrorAlert | undefined;
  setAlert: Dispatch<SetStateAction<ErrorAlert | undefined>>;
  setErrorModal: Dispatch<SetStateAction<ErrorModalDTO | undefined>>;
}
const Context = createContext<ContextType | null>(null);
export const ErrorContextProvider = ({ children }: { children: ReactNode }) => {
  const [alert, setAlert] = useState<ErrorAlert>();
  const [errorModal, setErrorModal] = useState<ErrorModalDTO>();

  function dismissErrorModal() {
    setErrorModal(undefined);
  }

  return (
    <Context.Provider value={{ alert, setAlert, setErrorModal }}>
      {alert && <AlertBanner alert={alert} />}
      {errorModal && (
        <ErrorModal
          errorModal={errorModal}
          dismissErrorModal={dismissErrorModal}
        />
      )}
      {children}
    </Context.Provider>
  );
};

export const useErrorContext = () => {
  return useContext(Context) as ContextType;
};

const AlertBanner = ({ alert }: { alert: ErrorAlert }) => {
  return (
    <Callout.Root color={alert?.color}>
      <Callout.Icon></Callout.Icon>
      <Callout.Text>
        You will need admin privileges to install and access this application.
      </Callout.Text>
    </Callout.Root>
  );
};

type ErrorModalDTO = {
  title: string;
  description: string;
};

const ErrorModal = ({
  errorModal,
  dismissErrorModal,
}: {
  errorModal: ErrorModalDTO;
  dismissErrorModal: () => void;
}) => {
  return (
    <AlertDialog.Root open={true}>
      <AlertDialog.Content>
        <AlertDialog.Title>{errorModal.title}</AlertDialog.Title>
        <AlertDialog.Description>
          {errorModal.description}
        </AlertDialog.Description>
        <AlertDialog.Cancel>
          <Flex justify="end">
            <Button variant="soft" color="gray" onClick={dismissErrorModal}>
              Close
            </Button>
          </Flex>
        </AlertDialog.Cancel>
      </AlertDialog.Content>
    </AlertDialog.Root>
  );
};
