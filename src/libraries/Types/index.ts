import {FezData, UserHeader} from '../Structs/ControllerStructs';
import {ReactNode} from 'react';

export interface FezDataProps {
  fez: FezData;
}

export interface UserHeaderProps {
  user: UserHeader;
}

// https://www.reddit.com/r/typescript/comments/vdk8we/is_there_a_type_for_objects_with_arbitrary_keys/
export interface KvObject {
  [key: string]: string | null;
}

export type StringOrError = string | Error;

export type PropsWithUserHeader<P = unknown> = P & {userHeader: UserHeader};

export type PropsWithOnPress<P = unknown> = P & {onPress: () => void};
