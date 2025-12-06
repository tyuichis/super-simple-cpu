/*
    Saves a file using modern File System API or 
    fallback to the generic a element → download blob
    for unsupported browers like Firefox
*/

class FileSaver {
  /* 
    Main save handler
      Try to use FS API then fallback.
      Usage: call save() with the correct MIME type handler
  */
  static async save(data, fileName, options = {}) {
    /*

    data : the data to be saved (i.e. text or json blob)
    fileName
    options : MIME types as an object (see MDN docs for specific mime types)

    */

    // destructure MIME object and set defaults.
    const {
      mimeType = "text/plain",
      extension = ".txt",
      description = "Text File",
    } = options;

    if ("showSaveFilePicker" in window) {
      try {
        // browser API
        return await this.#saveWithPicker(data, fileName, {
          mimeType,
          extension,
          description,
        });
      } catch (error) {
        // MUST handle abort error, otherwise canceling file save still downloads the file.
        if (error.name === "AbortError") {
          return { cancelled: true };
        }

        console.error("Something went wrong saving.");
      }
    }

    // fallback
    return this.#saveWithDownload(data, fileName, mimeType);
  }

  static async #saveWithPicker(
    data,
    fileName,
    { mimeType, extension, description }
  ) {
    const fileHandler = await window.showSaveFilePicker({
      suggestedName: fileName,
      types: [{ description, accept: { [mimeType]: [extension] } }],
    });

    const writable = await fileHandler.createWritable();
    await writable.write(data);
    await writable.close();

    return { success: true, method: "picker" };
  }

  // fallback since Firefox doesn't support the saveFilePicker
  static #saveWithDownload(data, fileName, mimeType) {
    // blob is the raw binary data
    const blob = new Blob([data], { type: mimeType });

    // make a URL for this bloberino
    const downloadURL = URL.createObjectURL(blob);

    // create an element and immediately click on it to activate the download process.
    const downloadURLElement = document.createElement("a");
    downloadURLElement.href = downloadURL;
    downloadURLElement.download = fileName;
    downloadURLElement.click();

    // cleanup URL reference
    URL.revokeObjectURL(downloadURL);

    return { success: true, method: "download" };
  }

  // utility functions to handle mime types.

  static async saveJSON(data, fileName = `sscpu-${Date.now()}.json`) {
    // Format to JSON and pretty-print it (w/ arg 2)
    return this.save(JSON.stringify(data, null, 2), fileName, {
      mimeType: "application/json",
      extension: ".json",
      description: "JSON File",
    });
  }

  static async saveText(text, fileName = `sscpu-${Date.now()}.txt`) {
    return this.save(text, fileName, {
      mimeType: "text/plain",
      extension: ".txt",
      description: "Text File",
    });
  }
}

export { FileSaver };
