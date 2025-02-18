'use client';

export default function Index() {
  const onboardEmployeesClickHandler = async () => {
    await fetch('/api/onboard');
    alert('success');
  };
  const updateEmailSignaturesClickHandler = async () => {
    await fetch('/api/signature/updateEmailSignatures');
    alert('success');
  };
  const getZippedSignaturesClickHandler = async () => {
    const res = await fetch('/api/signature/downloadZippedSignatures');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-files.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    alert('success');
  };
  const offboardEmployeesClickHandler = async () => {
    await fetch('/api/offboard');
    alert('success');
  };

  return (
    <>
      <button onClick={onboardEmployeesClickHandler}>
        Onboard Incoming Employees
      </button>
      <br />

      <button onClick={getZippedSignaturesClickHandler}>
        Download Zipped Signatures
      </button>
      <br />
      <button onClick={updateEmailSignaturesClickHandler}>
        Update Email Signatures
      </button>
      <br />

      <button onClick={offboardEmployeesClickHandler}>
        Offboard Inactive Employees
      </button>
      <br />
    </>
  );
}
