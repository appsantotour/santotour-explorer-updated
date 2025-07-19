/// <reference types="vite/client" />

// Para suporte a importações com @/
declare module "@/*" {
  import { ComponentType } from "react";
  const component: ComponentType<any>;
  export default component;
}

declare module "@/hooks/use-user" {
  import { UserContextType } from "./hooks/use-user";
  export const useUser: () => UserContextType;
  export const UserProvider: React.FC<{ children: React.ReactNode }>;
}
