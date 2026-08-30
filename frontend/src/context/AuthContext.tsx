import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { authApi } from "@/api/auth";

import type {
  Action,
  AppUser,
  Resource,
  Role,
} from "@/types/auth";


/*
 * Матрица прав:
 *
 * ADMIN
 * - полный доступ
 * - CRUD по всем разделам
 * - управление пользователями
 *
 * OPERATOR
 * - CRUD:
 *   ломбарды
 *   владельцы
 *   клиенты
 *   ссуды
 *
 * - справочники:
 *   только просмотр
 *
 * - отчёты:
 *   недоступны
 *
 * - пользователи:
 *   недоступны
 *
 * ANALYST
 * - все основные разделы:
 *   только просмотр
 *
 * - справочники:
 *   только просмотр
 *
 * - отчёты:
 *   просмотр
 *
 * - пользователи:
 *   недоступны
 */
const permissions: Record<
  Role,
  Record<Resource, Action[]>
> = {

  ADMIN: {

    dashboard: ["view"],

    loans: [
      "view",
      "create",
      "edit",
      "delete",
    ],

    clients: [
      "view",
      "create",
      "edit",
      "delete",
    ],

    pawnshops: [
      "view",
      "create",
      "edit",
      "delete",
    ],

    owners: [
      "view",
      "create",
      "edit",
      "delete",
    ],

    dictionaries: [
      "view",
      "create",
      "edit",
      "delete",
    ],

    reports: [
      "view",
    ],

    users: [
      "view",
      "create",
      "edit",
      "delete",
    ],
  },


  OPERATOR: {

    dashboard: ["view"],

    loans: [
      "view",
      "create",
      "edit",
      "delete",
    ],

    clients: [
      "view",
      "create",
      "edit",
      "delete",
    ],

    pawnshops: [
      "view",
      "create",
      "edit",
      "delete",
    ],

    owners: [
      "view",
      "create",
      "edit",
      "delete",
    ],

    dictionaries: [
      "view",
    ],

    reports: [],

    users: [],
  },


  ANALYST: {

    dashboard: ["view"],

    loans: [
      "view",
    ],

    clients: [
      "view",
    ],

    pawnshops: [
      "view",
    ],

    owners: [
      "view",
    ],

    dictionaries: [
      "view",
    ],

    reports: [
      "view",
    ],

    users: [],
  },
};


interface AuthContextValue {

  user: AppUser | null;

  loading: boolean;

  login: (
    username: string,
    password: string
  ) => Promise<void>;

  logout: () => void;

  can: (
    resource: Resource,
    action: Action
  ) => boolean;
}


const AuthContext =
  createContext<AuthContextValue | null>(null);


export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {

  const [user, setUser] =
    useState<AppUser | null>(null);

  const [loading, setLoading] =
    useState(true);


  /*
   * Восстановление авторизации
   * после перезагрузки страницы.
   */
  useEffect(() => {

    const token =
      localStorage.getItem(
        "auth_token"
      );

    const savedUser =
      localStorage.getItem(
        "auth_user"
      );


    if (!token || !savedUser) {

      setLoading(false);

      return;
    }


    authApi
      .me()

      .then((currentUser) => {

        setUser(currentUser);

        localStorage.setItem(
          "auth_user",
          JSON.stringify(currentUser)
        );

      })

      .catch(() => {

        localStorage.removeItem(
          "auth_token"
        );

        localStorage.removeItem(
          "auth_user"
        );

        setUser(null);

      })

      .finally(() => {

        setLoading(false);

      });

  }, []);


  /*
   * Авторизация пользователя.
   */
  async function login(
    username: string,
    password: string
  ) {

    const {
      token,
      user: loggedInUser,
    } = await authApi.login(
      username,
      password
    );


    localStorage.setItem(
      "auth_token",
      token
    );


    localStorage.setItem(
      "auth_user",
      JSON.stringify(loggedInUser)
    );


    setUser(loggedInUser);
  }


  /*
   * Выход пользователя.
   */
  function logout() {

    localStorage.removeItem(
      "auth_token"
    );

    localStorage.removeItem(
      "auth_user"
    );


    setUser(null);
  }


  /*
   * Проверка права пользователя.
   *
   * Пример:
   *
   * can("dictionaries", "create")
   *
   * ADMIN     -> true
   * OPERATOR  -> false
   * ANALYST   -> false
   */
  function can(
    resource: Resource,
    action: Action
  ): boolean {

    if (!user) {
      return false;
    }


    const rolePermissions =
      permissions[user.role];


    /*
     * Защита от неизвестной роли.
     */
    if (!rolePermissions) {
      return false;
    }


    const resourcePermissions =
      rolePermissions[resource];


    /*
     * Защита от неизвестного ресурса.
     */
    if (!resourcePermissions) {
      return false;
    }


    return resourcePermissions.includes(
      action
    );
  }


  return (

    <AuthContext.Provider

      value={{
        user,
        loading,
        login,
        logout,
        can,
      }}

    >

      {children}

    </AuthContext.Provider>

  );
}


export function useAuth() {

  const context =
    useContext(AuthContext);


  if (!context) {

    throw new Error(
      "useAuth должен использоваться внутри AuthProvider"
    );

  }


  return context;
}
