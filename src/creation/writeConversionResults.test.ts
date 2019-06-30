import { createEmptyConversionResults } from "../conversion/conversionResults.stubs";
import { writeConversionResults } from "./writeConversionResults";

const tslintConfiguration = {
    ruleDirectories: [],
    rules: {},
};

describe("writeConversionResults", () => {
    it("excludes the tslint plugin when there are no missing rules", async () => {
        // Arrange
        const conversionResults = createEmptyConversionResults({
            converted: new Map(),
        });
        const fileSystem = { writeFile: jest.fn().mockReturnValue(Promise.resolve()) };

        // Act
        await writeConversionResults({ fileSystem }, conversionResults, tslintConfiguration);

        // Assert
        expect(fileSystem.writeFile).toHaveBeenLastCalledWith(
            ".eslintrc.json",
            JSON.stringify(
                {
                    parser: "@typescript-eslint/parser",
                    parserOptions: {
                        project: "tsconfig.json",
                    },
                    rules: {},
                },
                undefined,
                4,
            ),
        );
    });

    it("includes typescript-eslint plugin settings when there are missing rules", async () => {
        // Arrange
        const conversionResults = createEmptyConversionResults({
            converted: new Map(),
            missing: [
                {
                    ruleArguments: [],
                    ruleName: "tslint-rule-one",
                    ruleSeverity: "error",
                },
            ],
        });
        const fileSystem = { writeFile: jest.fn().mockReturnValue(Promise.resolve()) };

        // Act
        await writeConversionResults({ fileSystem }, conversionResults, tslintConfiguration);

        // Assert
        expect(fileSystem.writeFile).toHaveBeenLastCalledWith(
            ".eslintrc.json",
            JSON.stringify(
                {
                    parser: "@typescript-eslint/parser",
                    parserOptions: {
                        project: "tsconfig.json",
                    },
                    plugins: ["@typescript-eslint/tslint"],
                    rules: {
                        "@typescript-eslint/tslint/config": [
                            "error",
                            {
                                rules: {
                                    "tslint-rule-one": true,
                                },
                            },
                        ],
                    },
                },
                undefined,
                4,
            ),
        );
    });
});