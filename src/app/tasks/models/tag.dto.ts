export interface TagDto {
  id: number;
  name: string;
  description?: string;
  colour: string;
}

export const tagConstraints = {
  minLength: 3,
  maxLength: 12,
};
