declare interface Html2PdfInstance {
  set: (options: any) => {
    from: (el: Element | string) => { save: () => void };
  };
}

declare function html2pdf(): Html2PdfInstance;
