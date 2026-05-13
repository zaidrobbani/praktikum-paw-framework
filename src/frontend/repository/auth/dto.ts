export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  name: string;
  email: string;
  password: string;
};

export type RegisterResponse = {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    createdAt: string;
  };
};

export type LoginResponse = {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    createdAt: string;
  };
};

export type RefreshResponse = {
  accessToken: string;
};

export type ProfileResponse = {
  user: {
    id: string;
    email: string;
    name: string;
    createdAt: string;
  };
};
