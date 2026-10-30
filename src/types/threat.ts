export type ThreatType = 'URL' | 'MESSAGE' | 'APP';

export type Verdict = 'Safe' | 'Caution' | 'Dangerous';

export interface RiskFactor {
  type: 'PHISHING' | 'MALWARE' | 'KNOWN_MALWARE_SIGNATURE' | 'PERMISSION_OVERREACH' | 'DEFACEMENT' | 'SOCIAL_ENGINEERING' | 'SUSPICIOUS_DOMAIN' | 'UNOFFICIAL_SOURCE' | 'UNKNOWN' | string;
  description: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

export interface AlternativeLink {
  title: string;
  url: string;
  badge?: string;
}

export interface ThreatReport {
  id: string;
  timestamp: number;
  type: ThreatType;
  target: string;
  verdict: Verdict;
  confidenceScore: number;
  explanation: string;
  riskFactors: RiskFactor[];
  alternativeLinks?: AlternativeLink[];
  metadata?: {
    isSpamModule?: boolean;
    is_spam?: boolean;
    spam_probability?: number;
    hamPercentage?: string;
    spamPercentage?: string;
    rawLabel?: string;
    developer?: string;
    appName?: string;
    totalPermissions?: number;
    dangerousPermissions?: string[];
    fileName?: string;
    fileSize?: string;
  };
}

export interface BulkUrlResult {
  url: string;
  verdict: Verdict;
  confidenceScore: number;
  explanation: string;
  threatType: string;
  riskFactors: RiskFactor[];
  alternativeLinks?: AlternativeLink[];
}

export interface PresetApp {
  id: string;
  name: string;
  developer: string;
  category: string;
  icon: string;
  expectedVerdict: Verdict;
  description: string;
  permissions: string[];
}
