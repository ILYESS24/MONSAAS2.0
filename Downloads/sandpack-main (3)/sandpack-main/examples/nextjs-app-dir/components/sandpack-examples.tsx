import { memo, useMemo } from "react";
import { Sandpack } from "@codesandbox/sandpack-react";
import { sandpackDark } from "@codesandbox/sandpack-themes";

const SandpackExamples = memo(() => {
  // Optimisation : mémorisation des options pour éviter les re-renders
  const sandpackOptions = useMemo(() => ({
    editorHeight: '100vh',
    editorWidthPercentage: 50,
    showTabs: true,
    showLineNumbers: true,
    showInlineErrors: true,
    closableTabs: true,
    showPreview: true,
    showNavigator: false,
    showConsole: true,
    showConsoleButton: true,
  }), []);

  return (
    <div style={{ height: '100vh' }}>
      <Sandpack
        theme={sandpackDark}
        template="node"
        options={sandpackOptions}
      />
    </div>
  );
});

SandpackExamples.displayName = 'SandpackExamples';

export { SandpackExamples };
