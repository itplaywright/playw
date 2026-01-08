
"use client"

import Editor from "@monaco-editor/react"

interface CodeEditorProps {
    value?: string
    defaultValue?: string
    onChange?: (value: string | undefined) => void
}

export default function CodeEditor({ value, defaultValue, onChange }: CodeEditorProps) {
    const handleEditorDidMount = (editor: any, monaco: any) => {
        // Configure TypeScript compiler options
        monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
            target: monaco.languages.typescript.ScriptTarget.ESNext,
            allowNonTsExtensions: true,
            moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
            module: monaco.languages.typescript.ModuleKind.CommonJS,
            noEmit: true,
            esModuleInterop: true,
        });

        // Add Playwright types
        monaco.languages.typescript.typescriptDefaults.addExtraLib(
            `declare module '@playwright/test' {
                export const test: any;
                export const expect: any;
            }`,
            "file:///node_modules/@playwright/test/index.d.ts"
        );
    }

    return (
        <Editor
            height="100%"
            defaultLanguage="typescript"
            value={value}
            defaultValue={defaultValue}
            theme="vs-dark"
            onMount={handleEditorDidMount}
            options={{
                minimap: { enabled: false },
                fontSize: 14,
                scrollBeyondLastLine: false,
                automaticLayout: true,
            }}
            onChange={onChange}
        />
    )
}
