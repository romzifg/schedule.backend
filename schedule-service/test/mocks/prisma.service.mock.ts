export const mockSchedules: any[] = [];

export const mockCustomer = {
    id: 'customer-1',
    name: 'John',
    email: 'john@mail.com',
    createdAt: new Date(),
    updatedAt: new Date(),
};

export const mockDoctor = {
    id: 'doctor-1',
    name: 'Dr. Strange',
    createdAt: new Date(),
    updatedAt: new Date(),
};

export const createMockPrismaService = () => ({
    customer: {
        create: jest.fn().mockResolvedValue(mockCustomer),
        findMany: jest.fn().mockResolvedValue([mockCustomer]),
        findUnique: jest.fn().mockResolvedValue(mockCustomer),
    },
    doctor: {
        create: jest.fn().mockResolvedValue(mockDoctor),
        findMany: jest.fn().mockResolvedValue([mockDoctor]),
        findUnique: jest.fn().mockResolvedValue(mockDoctor),
    },
    schedule: {
        create: jest.fn().mockImplementation(async (args) => {
            const existing = mockSchedules.find(
                (s) =>
                    s.doctorId === args.data.doctorId &&
                    s.scheduledAt.getTime() === new Date(args.data.scheduledAt).getTime()
            );

            if (existing) {
                throw new Error('Schedule conflict');
            }

            const schedule = {
                id: `schedule-${mockSchedules.length + 1}`,
                objective: args.data.objective,
                customerId: args.data.customerId,
                doctorId: args.data.doctorId,
                scheduledAt: new Date(args.data.scheduledAt),
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            mockSchedules.push(schedule);
            return schedule;
        }),
        findFirst: jest.fn().mockImplementation((args) => {
            // Tambahkan findFirst method
            return mockSchedules.find(
                (s) =>
                    s.doctorId === args.where.doctorId &&
                    s.scheduledAt.getTime() === new Date(args.where.scheduledAt).getTime()
            );
        }),
        findMany: jest.fn().mockImplementation(() => mockSchedules),
        findUnique: jest.fn().mockImplementation((args) => {
            return mockSchedules.find((s) => s.id === args.where.id);
        }),
        delete: jest.fn().mockImplementation((args) => {
            const index = mockSchedules.findIndex((s) => s.id === args.where.id);
            if (index > -1) {
                const deleted = mockSchedules.splice(index, 1)[0];
                return deleted;
            }
            return null;
        }),
        deleteMany: jest.fn().mockImplementation(() => {
            const count = mockSchedules.length;
            mockSchedules.length = 0;
            return { count };
        }),
    },
    $connect: jest.fn().mockResolvedValue(undefined),
    $disconnect: jest.fn().mockResolvedValue(undefined),
});