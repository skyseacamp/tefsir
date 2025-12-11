import { User } from "@/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface userData {
  email: string;
  password: string;
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("token");
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token);
    }
  }

  removeToken() {
    this.token = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  // Auth endpoints
  async login(userData: userData) {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async register(userData: userData) {
    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async getCurrentUser() {
    return this.request("/auth/me");
  }

  // User endpoints
  async getUsers() {
    return this.request("/users");
  }

  async getUser(id: string) {
    return this.request(`/users/${id}`);
  }

  async updateUser(id: string, userData: userData) {
    return this.request(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    });
  }

  // // Book endpoints
  // async getBooks() {
  //   return this.request("/books");
  // }

  // async getBook(id: string) {
  //   return this.request(`/books/${id}`);
  // }

  // async createBook(bookData: any) {
  //   return this.request("/books", {
  //     method: "POST",
  //     body: JSON.stringify(bookData),
  //   });
  // }

  // async updateBook(id: string, bookData: any) {
  //   return this.request(`/books/${id}`, {
  //     method: "PUT",
  //     body: JSON.stringify(bookData),
  //   });
  // }

  // async deleteBook(id: string) {
  //   return this.request(`/books/${id}`, {
  //     method: "DELETE",
  //   });
  // }

  // // Topic endpoints
  // async getTopics(params?: any) {
  //   const queryString = params
  //     ? "?" + new URLSearchParams(params).toString()
  //     : "";
  //   return this.request(`/topics${queryString}`);
  // }

  // async getTopic(id: string) {
  //   return this.request(`/topics/${id}`);
  // }

  // async createTopic(topicData: any) {
  //   return this.request("/topics", {
  //     method: "POST",
  //     body: JSON.stringify(topicData),
  //   });
  // }

  // async updateTopic(id: string, topicData: any) {
  //   return this.request(`/topics/${id}`, {
  //     method: "PUT",
  //     body: JSON.stringify(topicData),
  //   });
  // }

  // async deleteTopic(id: string) {
  //   return this.request(`/topics/${id}`, {
  //     method: "DELETE",
  //   });
  // }

  // // Presentation endpoints
  // async getPresentations(params?: any) {
  //   const queryString = params
  //     ? "?" + new URLSearchParams(params).toString()
  //     : "";
  //   return this.request(`/presentations${queryString}`);
  // }

  // async getPresentation(id: string) {
  //   return this.request(`/presentations/${id}`);
  // }

  // async createPresentation(presentationData: any) {
  //   return this.request("/presentations", {
  //     method: "POST",
  //     body: JSON.stringify(presentationData),
  //   });
  // }

  // async updatePresentation(id: string, presentationData: any) {
  //   return this.request(`/presentations/${id}`, {
  //     method: "PUT",
  //     body: JSON.stringify(presentationData),
  //   });
  // }

  // async deletePresentation(id: string) {
  //   return this.request(`/presentations/${id}`, {
  //     method: "DELETE",
  //   });
  // }

  // async getAuthorPresentations(authorId: string) {
  //   return this.request(`/presentations/author/${authorId}`);
  // }
}

export const apiClient = new ApiClient(API_BASE_URL);
