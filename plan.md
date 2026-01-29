Chào bạn, đây là một bài tập thực hành rất thực tế trong lập trình web, tập trung vào việc xử lý dữ liệu (Logic), giao diện (UI) và quản lý phiên bản (Git).

Dưới đây là lời giải thích chi tiết cho từng yêu cầu của đề bài để bạn dễ dàng hình dung việc cần làm:

---

### 1. Chuyển "Xoá cứng" thành "Xoá mềm" (Soft Delete)

* **Hiện tại (Xoá cứng - Hard Delete):** Khi bạn nhấn xoá một bài viết (Post), dữ liệu đó bị loại bỏ hoàn toàn khỏi bộ nhớ (mảng hoặc cơ sở dữ liệu).
* **Yêu cầu mới (Xoá mềm - Soft Delete):**
* Bạn **không được** xoá dữ liệu đó đi.
* Thay vào đó, bạn cần thêm một thuộc tính (property) mới vào đối tượng bài viết, ví dụ: `isDeleted: true`.
* Ban đầu khi tạo mới, mặc định `isDeleted` sẽ là `false` (hoặc không có).
* Khi người dùng nhấn nút "Xoá", bạn chỉ cập nhật `post.isDeleted = true`.



### 2. Hiển thị các Post đã xoá mềm

* **Logic:** Thông thường, các bài viết đã xoá mềm sẽ bị ẩn đi. Tuy nhiên, đề bài này yêu cầu bạn **vẫn hiển thị chúng**.
* **Giao diện (UI):** Bạn cần kiểm tra điều kiện (Conditional Rendering).
* Nếu `isDeleted == true`  Áp dụng CSS để gạch ngang chữ (strikethrough) hoặc làm mờ đi để người dùng biết bài này đã bị đánh dấu xoá.
* Ví dụ CSS: `text-decoration: line-through; opacity: 0.6;`.



### 3. Tự động tăng ID (Auto-increment ID)

* **Vấn đề:** Hiện tại có thể bạn đang nhập tay ID, hoặc ID đang random.
* **Yêu cầu:**
* Trên form tạo mới: Ẩn ô nhập ID hoặc để trống, người dùng không cần quan tâm đến nó.
* **Logic tính toán:** Khi bấm "Tạo mới/Lưu", hệ thống phải tìm ID lớn nhất (`maxId`) hiện có trong danh sách.
* ID mới = `maxId + 1`.
* **Lưu ý quan trọng:** Đề bài yêu cầu ID lưu trong CSDL là **chuỗi (string)**. Vì vậy, bạn cần chuyển đổi kiểu dữ liệu:
1. Lấy danh sách ID hiện tại.
2. Chuyển chúng sang số (Integer) để tìm số lớn nhất (Max).
3. Cộng 1.
4. Chuyển kết quả ngược lại thành chuỗi để lưu (ví dụ: đang có ID "9", tạo mới thành "10").





### 4. CRUD với Comments (Bình luận)

Đây là phần phức tạp nhất, yêu cầu bạn xây dựng tính năng quản lý bình luận cho từng bài viết.

* **Cấu trúc dữ liệu:** Mỗi đối tượng `Post` nên có thêm một mảng chứa các `Comment`. Ví dụ:
```javascript
{
  id: "1",
  title: "Bài viết 1",
  isDeleted: false,
  comments: [
    { id: "c1", content: "Bài hay quá" },
    { id: "c2", content: "Cần bổ sung thêm" }
  ]
}
đọc db.json để biết các cấu trúc dữ liệu để làm cho phù hợp
làm bootstrap và thêm file css và chuyển các css trong html vào file css riêng.
```
* **Chức năng cần làm:**
* **C (Create):** Có ô input để viết bình luận và nút "Gửi" để thêm vào mảng `comments` của bài viết đó.
* **R (Read):** Hiển thị danh sách các bình luận bên dưới bài viết.
* **U (Update):** Cho phép sửa nội dung bình luận đã đăng.
* **D (Delete):** Cho phép xoá một bình luận.




---

### Tóm tắt luồng công việc bạn cần làm:

1. Sửa cấu trúc dữ liệu `Post` (thêm `isDeleted`, `comments`).
2. Viết hàm tìm `maxId` để sinh ID tự động.
3. Sửa hàm Xoá: thay vì `splice` thì `edit` trạng thái `isDeleted`.
4. Sửa giao diện HTML/CSS: thêm class gạch ngang nếu `isDeleted`.
5. Viết thêm UI và Logic cho phần Comment (thêm, sửa, xóa, hiển thị).

**Bạn có muốn mình hỗ trợ viết đoạn code mẫu cho phần "Tự động tăng ID" hoặc "Logic Xoá mềm" không?**