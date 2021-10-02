import { SvgIconComponent } from '@mui/icons-material';

export interface BotData {
  token: string;
  ledgerChannelId: string;
  lastName: string;
  lastAvatarURL: string;
  lastLedgerChannelName: string;
}

export interface UpdateStatutResult {
  logging: UpdateStatutResultEntry;
  channelSearch: UpdateStatutResultEntry;
}
export interface UpdateStatutResultEntry {
  success: boolean;
  errorMessage?: string;
}

export interface SubPanel {
  displayName: string;
  panel: any;
  icon: SvgIconComponent;
}

export interface PasswordData {
  serviceName: string;
  password: string | null;
  updateDate: number;
}
