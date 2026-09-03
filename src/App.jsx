import React, { useEffect, useMemo } from 'react';
import originalHtml from '../portfolio.html?raw';

const ORIGINAL_HEAD_ATTRIBUTE = 'data-original-portfolio-head';
const ORIGINAL_SCRIPT_ATTRIBUTE = 'data-original-portfolio-script';

function parseOriginalPage() {
  return new DOMParser().parseFromString(originalHtml, 'text/html');
}

function App() {
  const pageHtml = useMemo(() => {
    const documentHtml = parseOriginalPage();

    documentHtml.body.querySelectorAll('script').forEach((script) => script.remove());

    return documentHtml.body.innerHTML;
  }, []);

  useEffect(() => {
    const documentHtml = parseOriginalPage();
    const injectedHeadNodes = [];
    const injectedScripts = [];

    documentHtml.head.querySelectorAll('link, style').forEach((node) => {
      const clonedNode = node.cloneNode(true);
      clonedNode.setAttribute(ORIGINAL_HEAD_ATTRIBUTE, 'true');
      document.head.appendChild(clonedNode);
      injectedHeadNodes.push(clonedNode);
    });

    documentHtml.body.querySelectorAll('script').forEach((script) => {
      const clonedScript = document.createElement('script');
      clonedScript.setAttribute(ORIGINAL_SCRIPT_ATTRIBUTE, 'true');

      Array.from(script.attributes).forEach((attribute) => {
        clonedScript.setAttribute(attribute.name, attribute.value);
      });

      clonedScript.textContent = script.textContent;
      document.body.appendChild(clonedScript);
      injectedScripts.push(clonedScript);
    });

    return () => {
      injectedHeadNodes.forEach((node) => node.remove());
      injectedScripts.forEach((script) => script.remove());
      document.body.style.overflow = '';
    };
  }, []);

  return <main dangerouslySetInnerHTML={{ __html: pageHtml }} />;
}

export default App;
