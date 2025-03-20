module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testPathIgnorePatterns: ['/node_modules/', '/dist/', '/build/'],
    roots: ['<rootDir>/src', '<rootDir>/tests'],
    transform: {
        '^.+\\.tsx?$': 'ts-jest'
    },
    moduleNameMapper: {
        '^loader/(.*)$': '<rootDir>/src/loaders/$1',
        '^util/(.*)$': '<rootDir>/src/shared/utils/$1',
        '^config/(.*)$': '<rootDir>/src/configs/$1',
        '^repository/(.*)$': '<rootDir>/src/repositories/$1',
        '^common/(.*)$': '<rootDir>/src/common/$1',
        '^responses/(.*)$': '<rootDir>/src/responses/$1',
        '^services/(.*)$': '<rootDir>/src/api/services/$1',
        "config/app-config": '<rootDir>/src/configs/app.config',
    },
    setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
    collectCoverage: true,
    collectCoverageFrom: [
        'src/**/*.{ts,tsx}',
        '!src/**/*.d.ts'
    ]
};
