% Dirección de entrada
DireccionEntrada = 'D:\dayaa\Proyectos\Modular\Convers';

% Crear la carpeta de salida
DireccionSalida = fullfile(DireccionEntrada, 'Unsolocanal');
if ~exist(DireccionSalida, 'dir')
    mkdir(DireccionSalida);
    fprintf('Carpeta creada para salida: %s\n', DireccionSalida);
end

% Obtener lista de archivos en la carpeta de entrada
Archivos = dir(fullfile(DireccionEntrada, '*.bmp')); % Solo procesa imágenes BMP
if isempty(Archivos)
    fprintf('No se encontraron imágenes en la carpeta especificada.\n');
    return;
end

% Definir el tamaño del recorte (por ejemplo, 10 píxeles de cada borde)
MargenRecorte = 20;

% Procesar cada archivo
fprintf('Procesando imágenes...\n');
for i = 1:length(Archivos)
    NombreArchivo = Archivos(i).name;
    RutaArchivo = fullfile(DireccionEntrada, NombreArchivo);

    % Leer la imagen
    Imagen = imread(RutaArchivo);

    % Validar que la imagen esté en escala de grises
    if size(Imagen, 3) ~= 1
        % Si tiene múltiples canales, convertirla a escala de grises
        Imagen = rgb2gray(Imagen);
        fprintf('La imagen %s no estaba en escala de grises y se convirtió.\n', NombreArchivo);
    else
        fprintf('La imagen %s ya está en escala de grises.\n', NombreArchivo);
    end

    % Recortar las orillas
    [Alto, Ancho] = size(Imagen);
    if 2 * MargenRecorte < Alto && 2 * MargenRecorte < Ancho
        ImagenRecortada = Imagen(MargenRecorte+1:end-MargenRecorte, MargenRecorte+1:end-MargenRecorte);
        fprintf('La imagen %s fue recortada.\n', NombreArchivo);
    else
        ImagenRecortada = Imagen; % Si el recorte excede las dimensiones, no recortar
        fprintf('La imagen %s no se recortó debido a dimensiones insuficientes.\n', NombreArchivo);
    end

    % Guardar la imagen en la carpeta de salida
    RutaSalida = fullfile(DireccionSalida, NombreArchivo);
    imwrite(ImagenRecortada, RutaSalida);
    fprintf('Imagen procesada y guardada como: %s\n', RutaSalida);
end

fprintf('Todas las imágenes se han procesado, recortado y guardado en: %s\n', DireccionSalida);
