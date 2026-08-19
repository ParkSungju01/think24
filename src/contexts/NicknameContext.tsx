import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from 'react';
import { getNickname, setNickname } from '../lib/localNickname';

// docs/plans/local-only-migration.md "2. 닉네임 로컬 스토어": AuthContext가 하던 "닉네임
// 전역 공유" 역할만 이어받는다. 로컬 쓰기라 실패하지 않으므로 async/에러 케이스가 없다.

interface NicknameContextValue {
  nickname: string;
  updateNickname: (next: string) => void;
}

const NicknameContext = createContext<NicknameContextValue | undefined>(
  undefined,
);

export function NicknameProvider({ children }: { children: ReactNode }) {
  const [nickname, setNicknameState] = useState(getNickname());

  const updateNickname = (next: string) => {
    setNickname(next);
    setNicknameState(next);
  };

  return (
    <NicknameContext.Provider value={{ nickname, updateNickname }}>
      {children}
    </NicknameContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- Provider와 함께 두는 것이 계획서 컨벤션(AuthContext.tsx 단일 파일)에 맞음
export function useNickname(): NicknameContextValue {
  const context = useContext(NicknameContext);
  if (!context) {
    throw new Error('useNickname must be used within a NicknameProvider');
  }
  return context;
}
