import axios from "axios";

export async function utils_pdf_download(url: string) {
  try {
    const response = await axios.get(url, {
      responseType: "blob", // Đảm bảo nhận dữ liệu dạng blob để tải file
    });

    // Tạo một URL tạm từ dữ liệu blob nhận được
    const blob = new Blob([response.data], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = "file.pdf";
    link.click();

    // Giải phóng URL tạm khi đã hoàn thành
    window.URL.revokeObjectURL(link.href);
  } catch (error) {
    console.error("Error downloading PDF:", error);
  }
}
