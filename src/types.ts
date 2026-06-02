export enum RoomId {
  LOBBY = 'lobby',
  MEETING = 'meeting',
  FOCUS = 'focus',
  PANTRY = 'pantry',
  HELPDESK = 'helpdesk',
  PROJECT = 'project',
  DEVAREA = 'devarea',
  HR = 'hr',
}

export interface Room {
  id: RoomId;
  nameEn: string;
  nameTh: string;
  descriptionEn: string;
  descriptionTh: string;
  color: string;
  bgGradient: string;
  coordinates: { x: number; y: number; width: number; height: number }; // Relative percentage coordinates for isometric positioning
}

export interface Character {
  id: string;
  name: string;
  nameTh: string;
  role: string;
  roleTh: string;
  avatar: string;
  currentRoom: RoomId;
  status: 'Online' | 'Busy' | 'Coding' | 'Away' | 'Drinking Coffee' | 'In Meeting';
  statusColor: string;
  isAi: boolean;
  avatarUrl: string; // pixel style avatar or emoji representation
  greetingTh: string;
  greetingEn: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: string;
  channel: string; // 'group' | 'senior-dev' | 'code-reviewer' | 'system'
}

export interface OfficeTask {
  id: string;
  title: string;
  description: string;
  assignee: string; // Character ID
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high';
}

export interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  room: string;
  attendees: string[];
  description: string;
}
