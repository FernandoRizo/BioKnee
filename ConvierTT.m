function varargout = ConvierTT(varargin)
% CONVIERTT MATLAB code for ConvierTT.fig

gui_Singleton = 1;
gui_State = struct('gui_Name',       mfilename, ...
                   'gui_Singleton',  gui_Singleton, ...
                   'gui_OpeningFcn', @ConvierTT_OpeningFcn, ...
                   'gui_OutputFcn',  @ConvierTT_OutputFcn, ...
                   'gui_LayoutFcn',  [] , ...
                   'gui_Callback',   []);
if nargin && ischar(varargin{1})
    gui_State.gui_Callback = str2func(varargin{1});
end

if nargout
    [varargout{1:nargout}] = gui_mainfcn(gui_State, varargin{:});
else
    gui_mainfcn(gui_State, varargin{:});
end
% End initialization code - DO NOT EDIT

% --- Executes just before ConvierTT is made visible.
function ConvierTT_OpeningFcn(hObject, eventdata, handles, varargin)
% This function has no output args, see OutputFcn.
% hObject    handle to figure
% eventdata  reserved - to be defined in a future version of MATLAB
% handles    structure with handles and user data (see GUIDATA)
% varargin   command line arguments to ConvierTT (see VARARGIN)

% Choose default command line output for ConvierTT
handles.output = hObject;

handles.Version=1.5;

% Update handles structure
guidata(hObject, handles);

% UIWAIT makes ConvierTT wait for user response (see UIRESUME)
% uiwait(handles.figure1);


% --- Outputs from this function are returned to the command line.
function varargout = ConvierTT_OutputFcn(hObject, eventdata, handles) 
% varargout  cell array for returning output args (see VARARGOUT);
% hObject    handle to figure
% eventdata  reserved - to be defined in a future version of MATLAB
% handles    structure with handles and user data (see GUIDATA)

% Get default command line output from handles structure
varargout{1} = handles.output;


% --- Executes on button press in pbAbrir.
function pbAbrir_Callback(hObject, eventdata, handles)

[Archivo,Direccion]=uigetfile({'*.png','Imágenes Médicas (*.png)'},'Abrir archivo');

if Archivo==0
    return;
end

handles.Archivo=Archivo;
handles.Direccion=Direccion;
set(handles.pbConvertir,'Enable','On');
set(handles.cbTodos,'Enable','On');
set(handles.cbAjustar,'Enable','On');
set(handles.cbRecortar,'Enable','On');
set(handles.eEstatus,'String','Preparado para convertir');
guidata(hObject, handles);


function eEstatus_Callback(hObject, eventdata, handles)
% hObject    handle to eEstatus (see GCBO)
% eventdata  reserved - to be defined in a future version of MATLAB
% handles    structure with handles and user data (see GUIDATA)

% Hints: get(hObject,'String') returns contents of eEstatus as text
%        str2double(get(hObject,'String')) returns contents of eEstatus as a double

% --- Executes during object creation, after setting all properties.
function eEstatus_CreateFcn(hObject, eventdata, handles)
% hObject    handle to eEstatus (see GCBO)
% eventdata  reserved - to be defined in a future version of MATLAB
% handles    empty - handles not created until after all CreateFcns called

% Hint: edit controls usually have a white background on Windows.
%       See ISPC and COMPUTER.
if ispc && isequal(get(hObject,'BackgroundColor'), get(0,'defaultUicontrolBackgroundColor'))
    set(hObject,'BackgroundColor','white');
end


% --- Executes on button press in pbConvertir.
function pbConvertir_Callback(hObject, eventdata, handles)

set(handles.eEstatus,'String','Convirtiendo...');
pause(0.3);
Arch=handles.Archivo;
Dir=handles.Direccion;
Todos=get(handles.cbTodos,'Value');
Ajustar=get(handles.cbAjustar,'Value');
Recortar=get(handles.cbRecortar,'Value');

[Tiempo,Conversiones,K]=ConvierT(Arch,Dir,'bmp',Todos,Ajustar,Recortar);

Estatus=[' ',num2str(Conversiones),' archivos procesados en ',num2str(Tiempo),' seg.'];
set(handles.eEstatus,'String',Estatus);

if handles.Version==K
    Kernel=['v ',num2str(K)];
    set(handles.tKernel,'String',Kernel);
end


% --- Executes when selected object is changed in uibuttongroup1.
function uibuttongroup1_SelectionChangedFcn(hObject, eventdata, handles)
% hObject    handle to the selected object in uibuttongroup1 
% eventdata  reserved - to be defined in a future version of MATLAB
% handles    structure with handles and user data (see GUIDATA)


% --- Executes on button press in cbTodos.
function cbTodos_Callback(hObject, eventdata, handles)
% hObject    handle to cbTodos (see GCBO)
% eventdata  reserved - to be defined in a future version of MATLAB
% handles    structure with handles and user data (see GUIDATA)

% Hint: get(hObject,'Value') returns toggle state of cbTodos


% --- Executes on button press in cbAjustar.
function cbAjustar_Callback(hObject, eventdata, handles)
% hObject    handle to cbAjustar (see GCBO)
% eventdata  reserved - to be defined in a future version of MATLAB
% handles    structure with handles and user data (see GUIDATA)

% Hint: get(hObject,'Value') returns toggle state of cbAjustar


% --- Executes on button press in cbRecortar.
function cbRecortar_Callback(hObject, eventdata, handles)
% hObject    handle to cbRecortar (see GCBO)
% eventdata  reserved - to be defined in a future version of MATLAB
% handles    structure with handles and user data (see GUIDATA)

% Hint: get(hObject,'Value') returns toggle state of cbRecortar
