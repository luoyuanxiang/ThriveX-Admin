/**
 * top.luoyuanxiang.thrivex.server.entity.EmailServerConfigEntity
 */
export interface EmailServerConfig {
  /**
   * 配置描述
   */
  description?: string;
  /**
   * 状态：1-启用，0-禁用
   */
  enabled?: boolean;
  /**
   * 扩展配置
   */
  ext: object;
  /**
   * SMTP服务器地址
   */
  host?: string;
  id?: number;
  /**
   * 是否为默认配置
   */
  isDefault?: boolean;
  /**
   * 配置名称
   */
  name?: string;
  /**
   * 密码/授权码
   */
  password?: string;
  /**
   * SMTP服务器端口
   */
  port?: number;
  /**
   * 是否启用SSL
   */
  sslEnable?: boolean;
  /**
   * 是否启用TLS
   */
  tlsEnable?: boolean;
  /**
   * 发送者邮箱地址
   */
  username?: string;
  extStr?: string;
  [property: string]: never;
}
