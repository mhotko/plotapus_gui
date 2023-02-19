/* eslint-disable react/jsx-props-no-spreading */
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import "./css/Import.scss";
import { toast } from "react-toastify";

interface IFile {
  filename: string;
  filetype: string;
}

interface ImportProps {
  callActivateTab: Function;
}


export default function Import({callActivateTab}: ImportProps) {
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    let promises: any[] = [];

    acceptedFiles.forEach((value: File) => {
      const data = new FormData();
      data.append("file", value);
      promises.push(
        fetch("http://127.0.0.1:6969/upload_file", {
          method: "POST",
          body: data,
          cache: "default",
        })
      );
    });
    const id = toast.loading("Uploading files...", {
      position: "bottom-left",
      pauseOnFocusLoss: false
    });
    const results: Response[] = await Promise.all(promises);
    toast.dismiss(id)
    let responses: IPostResponse[] = []
    for(let i in results) {
      if (results[i].status === 200) {
        const file: IPostResponse = await results[i].json()
        toast.success(`Successfully opened ${file.filename}`, {
          position: "bottom-left",
          pauseOnFocusLoss: false
        })
        let t: IPostResponse = {
          filename: file.filename,
          filetype: file.filetype
        }
        responses.push(t)
      }
    }
    callActivateTab(responses)
  }, []);

  const onDropAccepted = useCallback(() => {}, []);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
    acceptedFiles,
  } = useDropzone({
    onDrop,
    accept: {
      "text/plain": [".txt"],
      "text/csv": [".csv"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "application/octet-stream": [".mpr"],
    },
    multiple: true,
    onDropAccepted,
  });

  return (
    <div className="import-container">
      <div
        {...getRootProps()}
        className={`dropzone-container ${isDragAccept ? "border-green" : ""} ${
          isDragReject ? "border-red" : ""
        }`}
      >
        <input {...getInputProps()} />
        {(() => {
          if (isDragActive && isDragAccept)
            return (
              <>
                <i className="far fa-file-upload" />
                <p>Drop the file here ...</p>
              </>
            );
          if (isDragActive && isDragReject)
            return (
              <>
                <i className="fas fa-times-octagon" />
                <p>File type not supported :/</p>
                <p>Currently only supports .csv, .txt, .xlsx and .mpr files</p>
              </>
            );
          return (
            <>
              <i className="far fa-folder-open" />
              <p>Drag 'n' drop a file here, or click to select the file</p>
              <p>Currently only supports .csv, .txt, .xlsx and .mpr files</p>
            </>
          );
        })()}
      </div>
    </div>
  );
}
