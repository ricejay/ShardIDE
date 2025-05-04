import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export function activate(context: vscode.ExtensionContext) {
  const dataPath = path.join(context.extensionPath, 'src', 'data', 'env.json');
  const raw = fs.readFileSync(dataPath, 'utf8');
  const functions = JSON.parse(raw);

  const provider = vscode.languages.registerCompletionItemProvider(
    'lua',
    {
      provideCompletionItems(document, position) {
        const completionItems = [];

        for (const fn of functions) {
          const item = new vscode.CompletionItem(fn.name, vscode.CompletionItemKind.Function);
          item.detail = fn.detail;
          item.insertText = new vscode.SnippetString(fn.insertText);
          item.documentation = new vscode.MarkdownString(fn.documentation);
          completionItems.push(item);

          // Add alias support (e.g., replaceclosure for hookfunction)
          if (fn.aliases) {
            for (const alias of fn.aliases) {
              const aliasItem = new vscode.CompletionItem(alias, vscode.CompletionItemKind.Function);
              aliasItem.detail = fn.detail + ' (alias)';
              aliasItem.insertText = new vscode.SnippetString(fn.insertText.replace(fn.name, alias));
              aliasItem.documentation = new vscode.MarkdownString(fn.documentation);
              completionItems.push(aliasItem);
            }
          }
        }

        return completionItems;
      }
    }
  );

  context.subscriptions.push(provider);
}