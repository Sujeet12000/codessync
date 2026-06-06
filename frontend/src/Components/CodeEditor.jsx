// frontend/src/components/CodeEditor.jsx
import socket from '../socket/socket';

window.socket = socket;
import { useEffect, useRef } from 'react';
import MonacoEditor from '@monaco-editor/react';

const DEFAULT_CODE = `function hello() {\n  console.log("CodeSync");\n}`;

/**
 * Props
 *   roomId        — current room
 *   remoteCode    — latest code pushed from server (null = not yet received)
 *   onLocalChange — notify parent of user edits (for any future state lifting)
 *   language      — monaco language id
 */
function CodeEditor({ roomId, remoteCode, onLocalChange, language = 'javascript' }) {
  const editorRef       = useRef(null);   // monaco editor instance
  // Prevents re-emitting a change we just received from the server
  const suppressEmitRef = useRef(false);

  // ── Apply remote code into the editor (no onChange fires) ──────────────────
  useEffect(() => {
    if (remoteCode === null) return;          // not synced yet, skip
    const editor = editorRef.current;
    if (!editor) return;

    const model = editor.getModel();
    if (!model) return;

    // If the content is already identical, do nothing (avoids cursor jumps)
    if (model.getValue() === remoteCode) return;

    suppressEmitRef.current = true;          // ← suppress the coming onChange
    // pushEditOperations preserves undo history and doesn't fire onChange
    model.pushEditOperations(
      [],
      [{ range: model.getFullModelRange(), text: remoteCode }],
      () => null,
    );
    suppressEmitRef.current = false;         // ← re-enable emissions
  }, [remoteCode]);

  // ── Monaco setup ───────────────────────────────────────────────────────────
  const handleEditorMount = (editor, monaco) => {
    console.log("MONACO MOUNTED");
    editorRef.current = editor;

    monaco.editor.defineTheme('codesync-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'keyword',   foreground: '4fffb0', fontStyle: 'bold' },
        { token: 'string',    foreground: 'ffd080' },
        { token: 'comment',   foreground: '4a5270', fontStyle: 'italic' },
        { token: 'number',    foreground: '00c8ff' },
        { token: 'delimiter', foreground: 'a0a8c0' },
        { token: 'type',      foreground: 'c792ea' },
      ],
      colors: {
        'editor.background':                '#0f1117',
        'editor.foreground':                '#e8eaf0',
        'editor.lineHighlightBackground':   '#13161d',
        'editorLineNumber.foreground':      '#2e3347',
        'editorLineNumber.activeForeground':'#4fffb0',
        'editorCursor.foreground':          '#4fffb0',
        'editor.selectionBackground':       '#4fffb025',
        'editorIndentGuide.background':     '#1f2430',
        'editorIndentGuide.activeBackground':'#2e3560',
        'editorGutter.background':          '#0f1117',
        'scrollbarSlider.background':       '#1f243088',
        'scrollbarSlider.hoverBackground':  '#2e344888',
      },
    });

    monaco.editor.setTheme('codesync-dark');
    editor.focus();
  };

  // ── onChange: only emit if change was from the LOCAL user ─────────────────
  const handleChange = (value) => {
    
  console.log('EDITOR CHANGE:', value);

  if (suppressEmitRef.current) return;
  if (value === undefined) return;

  onLocalChange?.(value);

  console.log('EMITTING CODE CHANGE');

  socket.emit('code-change', { roomId, code: value });
};

  return (
    <MonacoEditor
      height="700px"
      width="100%"
      
      language={language}
      defaultValue={DEFAULT_CODE}
      onChange={(value) => {
  console.log("MONACO FIRED", value);
  handleChange(value);
}}
      onMount={handleEditorMount}
      options={{
        fontSize:                    14,
        lineHeight:                  22,
        fontFamily:                  '"JetBrains Mono", "Fira Code", monospace',
        fontLigatures:               true,
        letterSpacing:               0.3,
        padding:                     { top: 20, bottom: 20 },
        minimap:                     { enabled: true, scale: 1, renderCharacters: false },
        scrollBeyondLastLine:        false,
        wordWrap:                    'off',
        lineNumbers:                 'on',
        glyphMargin:                 false,
        folding:                     true,
        renderLineHighlight:         'gutter',
        smoothScrolling:             true,
        cursorBlinking:              'phase',
        cursorSmoothCaretAnimation:  'on',
        cursorStyle:                 'line',
        automaticLayout:             true,
        tabSize:                     2,
        insertSpaces:                true,
        formatOnPaste:               true,
        suggestOnTriggerCharacters:  true,
        quickSuggestions:            true,
        parameterHints:              { enabled: true },
        snippetSuggestions:          'top',
      }}
    />
  );
}

export default CodeEditor;