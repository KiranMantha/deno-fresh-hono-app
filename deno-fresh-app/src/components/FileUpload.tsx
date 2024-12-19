import { useReducer } from 'preact/hooks';
import { Button } from './Button.tsx';

type State = {
  fileName: string;
  fileContent: string;
};

type Action = {
  type: 'SET_FILE' | 'RESET';
  payload?: {
    fileName: string;
    fileContent: string;
  };
};

const initialState: State = {
  fileName: '',
  fileContent: ''
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_FILE':
      return { ...state, fileName: action.payload?.fileName || '', fileContent: action.payload?.fileContent || '' };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

const FileUpload = ({
  onFileUpload
}: {
  onFileUpload: (fileDetails: { fileName: string; fileContent: string }) => void;
}) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const handleFileChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        // Safely cast result to string since we use readAsText
        const content = reader.result as string;
        dispatch({
          type: 'SET_FILE',
          payload: {
            fileName: file.name,
            fileContent: content
          }
        });
      };
      reader.readAsText(file);
    }
  };

  const resetFile = () => {
    dispatch({ type: 'RESET' });
  };

  return (
    <div class="bg-card text-card-foreground p-6 rounded-lg shadow-lg">
      <h2 class="text-lg font-semibold mb-4">Upload your file</h2>
      <label for="file-upload" class="block text-sm font-medium text-primary mb-2">
        Choose a file
      </label>
      <input
        type="file"
        id="file-upload"
        name="file-upload"
        className="w-full bg-input text-input border border-primary rounded-lg p-2 mb-4"
        onChange={handleFileChange}
      />
      {state.fileName ? (
        <div>
          <p>File Name: {state.fileName}</p>
          <h4>File Contents:</h4>
          <pre>{state.fileContent}</pre>
        </div>
      ) : null}
      <div class="flex justify-end">
        <Button
          disabled={!(state.fileName || state.fileContent)}
          className="bg-green-700 text-white px-4 py-2 rounded-lg mr-2"
          onClick={() => {
            onFileUpload(state);
          }}
        >
          Upload
        </Button>
        <Button className="bg-amber-700 text-white px-4 py-2 rounded-lg" onClick={resetFile}>
          Reset
        </Button>
      </div>
    </div>
  );
};

export default FileUpload;
