export function U0ChangeFileToAQDocumentType(file: File): Promise<any> {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();

    // Đọc tệp dưới dạng Base64
    fileReader.onloadend = () => {
      const fileName = file.name; // Tên tệp
      const fileExtension = file.name.split(".").pop(); // Phần mở rộng tệp
      const fileBase64String = fileReader.result as string; // Base64 string của tệp

      resolve({
        fileName,
        fileExtension,
        fileBase64String: fileBase64String.split(",")[1], // Chỉ lấy phần base64 sau dấu phẩy
      });
    };

    fileReader.onerror = reject;

    // Đọc tệp dưới dạng Data URL (Base64)
    fileReader.readAsDataURL(file);
  });
}
