import { defineConfig } from "vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
        landing: path.resolve(__dirname, "src/landing/landing.html"),
        login: path.resolve(__dirname, "src/account/login/login.html"),
        signup: path.resolve(__dirname, "src/account/signup/signup.html"),
        main_list: path.resolve(__dirname, "src/main/main_list/main_list.html"),
        detail: path.resolve(__dirname, "src/main/detail/detail.html"),
        genre_more: path.resolve(__dirname, "src/main/genre_more/genre_more.html"),
        mypage: path.resolve(__dirname, "src/mypage/mypage.html"),
        upload: path.resolve(__dirname, "src/paragraph/upload/upload.html"),
        edit: path.resolve(__dirname, "src/paragraph/edit/edit.html"),
      },
    },
  },
});
