// base

export const getSizeText = (size: number) => {
  if (size < 1024) return `${size}B`;
  if (size < 1048576) return `${Math.floor(size / 1024 * 10) / 10}KB`;
  if (size < 1073741824) return `${Math.floor(size / 1048576 * 10) / 10}MB`;
  return `${Math.floor(size / 1073741824 * 10) / 10}GB`;
};

export const getAccept = (accept?: string) => {
  const items: Array<{ accept: string; type: "ext" | "group" | "type"; label: string }> = [];
  if (accept) {
    accept.split(",").forEach(a => {
      const accept = a.trim();
      if (accept.startsWith(".")) {
        items.push({
          accept, type: "ext", label: (() => {
            if (/^\.png$/i.test(accept)) return "PNG";
            if (/^\.jpe?g$/i.test(accept)) return "JPEG";
            if (/^\.pdf$/i.test(accept)) return "PDF";
            if (/^\.gif$/i.test(accept)) return "GIF";
            if (/^\.docx?$/i.test(accept)) return "ドキュメント";
            if (/^\.xlsx?$/i.test(accept)) return "Excel";
            return accept;
          })()
        });
        return;
      }
      if (/[a-zA-Z]\/\*/.test(accept)) {
        items.push({
          accept, type: "group", label: (() => {
            if (/^image/.test(accept)) return "画像";
            if (/^video/.test(accept)) return "動画";
            if (/^audio/.test(accept)) return "音声";
            return accept;
          })()
        });
        return;
      }
      items.push({ accept, type: "type", label: accept });
    });
  }
  return { accept, items } as const;
};

// convert

export const convertFileToBase64 = (file: File | null | undefined) => {
  return new Promise<string | ArrayBuffer>((resolve, reject) => {
    if (file == null) {
      reject("file not set.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result == null) reject("convert failed.");
      else resolve(reader.result);
    };
    reader.readAsDataURL(file);
  });
};

export const convertBase64ToFile = (base64: string | ArrayBuffer | null | undefined, fileName: string, options?: FilePropertyBag) => {
  if (base64 == null) throw new Error("base64 not set");
  if (typeof base64 === "string") {
    const bin = decodeURIComponent(escape(atob(base64.replace(/^.*,/, ""))));
    let u8a = new Uint8Array(bin.length);
    for (let i = 0, il = bin.length; i < il; i++) {
      u8a[i] = bin.charCodeAt(i);
    }
    return new File([u8a.buffer], fileName, options);
  }
  return new File([new Uint8Array(base64)], fileName, options);
};

export const convertFileToBlob = (file: File | null | undefined) => {
  return file == null ? file : new Blob([file], { type: file.type });
};

export const convertBlobToFile = (blob: Blob | null | undefined, fileName: string) => {
  return blob == null ? blob : new File([blob], fileName, { type: blob.type });
};
