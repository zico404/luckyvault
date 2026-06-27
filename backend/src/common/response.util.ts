export function successResponse(data: any, message = 'Success') {
  return { success: true, message, data };
}

export function errorResponse(message: string, errors?: any) {
  return { success: false, message, errors };
}
