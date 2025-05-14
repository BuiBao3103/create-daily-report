import { DefaultMantineColor } from "@mantine/core";
import { notifications } from "@mantine/notifications";

interface I {
  crudType?: "delete" | "update" | "create"| "error";
  message?: string;
  color?: DefaultMantineColor | undefined;
}

export function utils_notification_show({ crudType = "create", message, color }: I) {
  if (crudType == "create") {
    notifications.show({
      message: message ? message : "Thêm thành công!",
      color: color ? color : "green",
    });
    return;
  }
  if (crudType == "update") {
    notifications.show({
      message: message ? message : "Chỉnh sửa thành công!",
      color: color ? color : "green",
    });
    return;
  }
  if (crudType == "delete") {
    notifications.show({
      message: message ? message : "Xóa thành công!",
      color: color ? color : "green",
    });
    return;
  }
  if (crudType == "error") {
    notifications.show({
      message: message ? message : "Lỗi!",
      color: color ? color : "red",
    });
    return;
  }
}
