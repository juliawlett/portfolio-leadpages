import React, { useEffect, useMemo } from 'react';
import originalHtml from '../portfolio.html?raw';

const ORIGINAL_HEAD_ATTRIBUTE = 'data-original-portfolio-head';
const ORIGINAL_SCRIPT_ATTRIBUTE = 'data-original-portfolio-script';

function parseOriginalPage() {
  return new DOMParser().parseFromString(originalHtml, 'text/html');
}

function addPreviewLinks() {
  const previewLinks = [];

  document.querySelectorAll('.project-preview .browser-view iframe').forEach((iframe) => {
    if (!iframe.src || iframe.parentElement.querySelector('.preview-link')) return;

    const link = document.createElement('a');
    link.className = 'preview-link';
    link.href = iframe.src;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.setAttribute('aria-label', `Abrir ${iframe.title || 'projeto'} em nova aba`);
    link.innerHTML = '<span>Abrir projeto</span><span aria-hidden="true">↗</span>';

    iframe.parentElement.appendChild(link);
    previewLinks.push(link);
  });

  return previewLinks;
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

    const previewLinks = addPreviewLinks();

    return () => {
      previewLinks.forEach((link) => link.remove());
      injectedHeadNodes.forEach((node) => node.remove());
      injectedScripts.forEach((script) => script.remove());
      document.body.style.overflow = '';
    };
  }, []);

  return <main dangerouslySetInnerHTML={{ __html: pageHtml }} />;
}

export default App;
