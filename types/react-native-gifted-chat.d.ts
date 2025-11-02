import React from "react";
declare module 'react-native-gifted-chat' {
  import * as React from 'react';
  import { ViewStyle, TextStyle } from 'react-native';

  export interface IUser { _id: string | number; name?: string; avatar?: string; }
  export interface IMessage {
    _id: string | number;
    text: string;
    createdAt: Date;
    user: IUser;
    image?: string;
    sent?: boolean;
    received?: boolean;
  }

  export interface GiftedChatProps {
    messages: IMessage[];
    onSend: (messages: IMessage[]) => void;
    user: IUser;
    renderBubble?: (props: any) => React.ReactNode;
    renderInputToolbar?: (props: any) => React.ReactNode;
    renderSend?: (props: any) => React.ReactNode;
    timeTextStyle?: { left?: TextStyle; right?: TextStyle };
    alwaysShowSend?: boolean;
    scrollToBottom?: boolean;
    showUserAvatar?: boolean;
    isTyping?: boolean;
    placeholder?: string;
    textInputProps?: any;
  }

  export class Bubble extends React.Component<any> {}
  export class InputToolbar extends React.Component<any> {}
  export class Send extends React.Component<any> {}
  export class GiftedChat extends React.Component<GiftedChatProps> {}

  export default GiftedChat;
}
