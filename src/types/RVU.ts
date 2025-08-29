export interface IRVU {
    id: number;
    Date: string | null;
    'CPT Code': string;
    Description: string;
    wRVU: number;
    Compensation: number;
    Category: string;
    Quantity: number;

    toString(): string;
}

export class RVU implements IRVU {
    id: number;
    Date: string | null;
    'CPT Code': string;
    Description: string;
    wRVU: number;
    Compensation: number;
    Category: string;
    Quantity: number;

    constructor(id: number, date: string | null, cptCode: string, description: string, wRVU: number, compensation: number, category: string, quantity: number) {
        this.id = id;
        this.Date = date;
        this['CPT Code'] = cptCode;
        this.Description = description;
        this.wRVU = wRVU;
        this.Compensation = compensation;
        this.Category = category;
        this.Quantity = quantity;
    }

    public toString = () : string => {
        return `${this.Description} on ${this.Date} (x${this.Quantity})`;
    }
}