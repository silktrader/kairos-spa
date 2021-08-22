export interface TagDto {
  id: number;
  title: string;
  description?: string;
  colour: number;
}

export const tagConstraints = {
  minLength: 3,
  maxLength: 15,
};

// tags helper object
export const Tags = {
  getHSLColour(hueValue: number): string {
    return `hsl(${hueValue}, 95%, 80%)`;
  },
};
