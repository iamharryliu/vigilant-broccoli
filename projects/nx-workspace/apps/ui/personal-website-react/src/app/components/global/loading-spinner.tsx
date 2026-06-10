type Props = {
  header?: string;
  message?: string;
};

export function LoadingSpinner({ header, message }: Props) {
  return (
    <div>
      <div className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-20 w-20 border-t-2 border-b-2 border-blue-500" />
      </div>
      {header ? (
        <h2 className="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-200 text-center">
          {header}
        </h2>
      ) : null}
      {message ? <p className="text-center mb-4">{message}</p> : null}
    </div>
  );
}
