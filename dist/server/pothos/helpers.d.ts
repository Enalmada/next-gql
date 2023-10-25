export interface DefaultScalars {
    Scalars: {
        DateTime: {
            Input: Date;
            Output: Date;
        };
        JSON: {
            Input: unknown;
            Output: unknown;
        };
        NonEmptyString: {
            Input: string;
            Output: string;
        };
    };
}
export declare const defaultBuilderOptions: {
    plugins: "withInput"[];
};
export declare function initializeBuilder(builder: PothosSchemaTypes.SchemaBuilder<PothosSchemaTypes.ExtendDefaultTypes<any>>): void;
