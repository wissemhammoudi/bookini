from __future__ import annotations

from pydantic import BaseModel, EmailStr


class NotificationSettings(BaseModel):
    email_notifications: bool
    sms_notifications: bool
    weekly_report: bool
    incident_alerts: bool


class SecuritySettings(BaseModel):
    session_timeout_minutes: int
    require_mfa_for_admins: bool
    password_rotation_days: int


class PlatformSettings(BaseModel):
    platform_name: str
    support_email: EmailStr
    timezone: str
    default_language: str


class ProfileSettings(BaseModel):
    full_name: str
    email: EmailStr
    phone: str
    title: str


class SettingsRecord(BaseModel):
    profile: ProfileSettings
    notifications: NotificationSettings
    platform: PlatformSettings
    security: SecuritySettings


class SettingsUpdateRequest(BaseModel):
    profile: ProfileSettings
    notifications: NotificationSettings
    platform: PlatformSettings
    security: SecuritySettings
