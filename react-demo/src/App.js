import { FunctionalComponent } from './components/FunctionalComponent';
import { ClassComponent } from './components/ClassComponent';

function App() {
  return (
    <div>
      <FunctionalComponent data="value">
        <p>Text passed from parent to child</p>
      </FunctionalComponent>
      <ClassComponent data="value">
        <p>Text passed from parent to child</p>
      </ClassComponent>
    </div>
  );
}

export default App;
