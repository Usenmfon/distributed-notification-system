export class Template_Version_Dto {
  definition: string;
  language_code: string;
  content: {
    subject: string;
    body: string;
  };
  is_active: boolean;
}
