import PngType from "../../../Assets/Images/ImageTypePng.svg";
import PdfType from "../../../Assets/Images/ImageTypePdf.svg";

const fileTypeList = [
  {
    imageType: "png",
    imageSrc: PngType,
    alt: "PNG 아이콘 이미지",
  },
  {
    imageType: "pdf",
    imageSrc: PdfType,
    alt: "PDF 아이콘 이미지",
  },
];

function useTransformData(arr) {
  if (!arr || !arr.length > 0) return null;

  const result = arr.reduce((acc, cur) => {
    const { files } = cur;

    let trasnformedFiles = files.map((item) => {
      let itemsFileType = item.fileType.split("/").pop();
      const fileInfo = fileTypeList.find(
        (each) => each.imageType === itemsFileType
      );

      return {
        ...item,
        fileType: itemsFileType,
        imageSrc: fileInfo ? fileInfo.imageSrc : null,
        alt: fileInfo ? fileInfo.alt : null,
      };
    });

    return [
      ...acc,
      {
        ...cur,
        files: trasnformedFiles,
      },
    ];
  }, []);

  return result;
}

export default useTransformData;
