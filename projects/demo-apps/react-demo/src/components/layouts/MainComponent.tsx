type MainProps = {
  children: React.ReactElement;
};

const Main = (props: MainProps) => {
  return <main className="pt-4 container">{props.children}</main>;
};

export default Main;
