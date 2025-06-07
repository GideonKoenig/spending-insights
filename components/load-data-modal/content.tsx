import { DropArea } from "@/components/load-data-modal/drop-area";
import { PreparedFileItem } from "@/components/load-data-modal/prepared-file-item";
import { PreparedFile } from "@/lib/data-injestion/types";

export function ModalContent(props: {
    files: PreparedFile[];
    updateFile: (fileName: string, newFile: PreparedFile) => void;
    removeFile: (fileName: string) => void;
    handleFileSelect: (files: FileList | null) => void;
}) {
    return (
        <div className="flex flex-col gap-4">
            <DropArea handleFileSelect={props.handleFileSelect} />

            <div className="px-2 grid grid-cols-[8rem_15rem_7rem_1fr_1rem] gap-2 items-center">
                {props.files.map((file) => (
                    <PreparedFileItem
                        key={file.fileName}
                        file={file}
                        updateFile={(newFile: PreparedFile) =>
                            props.updateFile(file.fileName, newFile)
                        }
                        removeFile={() => props.removeFile(file.fileName)}
                    />
                ))}
            </div>
        </div>
    );
}
