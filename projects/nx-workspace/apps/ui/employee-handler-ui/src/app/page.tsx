'use client';

export default function Index() {
  const clickHandler = async () => {
    const res = await fetch('/api/hello');
    console.log(res);
  };

  return (
    <>
      <button onClick={clickHandler}>Test</button>
    </>
  );
}
