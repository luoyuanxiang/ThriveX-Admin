export interface EmailTemplate {
  /**
   * 邮件内容
   */
  content?: string;
  id?: number;
  /**
   * 模板名称
   */
  name?: string;
  /**
   * 邮件主题
   */
  subject?: string;
  /**
   * 模板类型：TEXT/HTML
   */
  type?: 'TEXT' | 'HTML';
  [property: string]: never;
}

export interface ParamsColumns {
  /**
   * 字段名称
   */
  fieldName?: string,
  /**
   * 字段类型
   */
  fieldType?: string,
  /**
   * 字段描述
   */
  description?: string
}

// 在文件顶部附近添加类型定义
export interface CheckParamsFormValues {
  emailServerId: number;
  mail: string;
  templateName?: string;
  // 其他动态字段可选，使用索引签名处理
  [key: string]: never;
}