export interface EmailLogs {
  id?: number;
  /**
   * 内容
   */
  content?: string;
  /**
   * 邮件模板ID
   */
  emailTemplateId?: number;
  /**
   * 错误日志
   */
  errorMessage?: string;
  /**
   * 收件人
   */
  recipient?: string;
  /**
   * 邮件发送时间
   */
  sentAt?: string;
  /**
   * 状态:0-失败，1-成功
   */
  status?: boolean;
  /**
   * 标题
   */
  subject?: string;
}
