import { IsNotEmpty } from "class-validator";

export class CreateChatDto {
    @IsNotEmpty()
    content: string;
    
    @IsNotEmpty()
    reciver_id: string;
}