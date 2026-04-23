import { NS, ScriptArg } from "@ns";

/**
 * valid type of arguments.
 */
type ArgsValueBase = string | number | boolean;
export type ArgsValue = ArgsValueBase | string[] | number[] | boolean[] | ArgsValueBase[];

function is_argsValueBase ( value: any ): value is ArgsValueBase
{
	return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';
}

function is_argsValue ( value: any ): value is ArgsValue
{
	if ( Array.isArray( value ) )
	{
		return value.reduce( ( type_flag: boolean, e ) => type_flag && is_argsValueBase( e ), true );
	}
	else
	{
		return is_argsValueBase( value );
	}
}

/**
 * @interface ArgsConfig flag configurations
 * @remark 如果此flag具有默认值，则此flag是可选项，否则在调用脚本时必须设置此flag
 * @property {string} name - name of the flag
 * @property {string} short_option? - Unix-like flag (short form), default is ''. e.g. '-v'
 * @property {string} full_option? - Unix-like flag (long form), default is ''. e.g. '--version'
 * @property {Value} default_value? - default value of a flag, default is undefined.
 * @property {string} description? - displayed in usage.
 * @property {texture} value_type? - 此flag的值的类型，可以是'string' | 'number' | 'boolean' | 'string[]' | 'number[]' | 'boolean[]'
 */
interface ArgsConfig1
{
	name: string,
	short_option?: string,
	full_option?: string,
	default_value?: ArgsValue,
	description?: string,
	value_type?: 'string' | 'number' | 'boolean' | 'string[]' | 'number[]' | 'boolean[]',
}

/**
 * @function usage - return the usage of the script
 * @param script_name - name of the script
 * @param configs - flag configurations of the script
 * @returns - string of the usage
 * @example
 * ```txt
 * Usage: script.js
 * [--help=false]: print the usage.
 * --flag(-f): option of someArgument.
 * ```
 */
function usage ( script_name: string, configs: ArgsConfig[] ): string
{
	if ( script_name === '' )
	{
		script_name = 'unknown script';
	}
	let result = `Usage: ${script_name}\n`;

	result += '[--help=false]: print this usage.\n';
	for ( const config of configs ) 
	{
		let opt_name = '';
		if ( config.full_option )
		{
			opt_name += config.full_option;
			if ( config.short_option )
			{
				opt_name += `(${ config.short_option })`;
			}
		}
		else if ( config.short_option )
		{
			opt_name += config.short_option;
		}

		if ( config.default_value === undefined )
		{
			result += `[${opt_name}=${config.default_value}]`;
		}
		else
		{
			result += opt_name;
		}
		result += ': ';

		if ( config.description )
		{
			result += config.description;
		}
		else
		{
			result += `option of ${config.name}`;
		}
		result += '\n';
	}

	return result;
}

/**
 * @function parse_args - 解析ns.args，使用Unix-like flags格式
 * @param ns
 * @param script_name 
 * @param configs 
 * @returns 返回一个对象，属性名为config.name
 */
export function parse_args (
	script_name: string,
	configs: ArgsConfig[],
	...args: ScriptArg[]
): { [ key: string ]: ArgsValue }
{
	if ( script_name == '' )
	{
		throw new Error( 'empty script name' );
	}

	let result: { [ key: string ]: ArgsValue };

	for ( const arg in args )
	{
		
	}

	const base_option = configs.find( config => !config.short_option && !config.short_option );
	let option = base_option;
	for ( const arg in args )
	{
		if ( arg.slice( 0, 2 ) === '--' || arg.slice( 0, 1 ) === '-' )
		{
			if ( option !== base_option )
			{
				throw new Error( `argument ${ option?.name } has no value.\n
					${ usage( script_name, configs ) }` );
			}
			if ( arg.slice( 0, 2 ) === '--' )
			{
				option = configs.find( config => config.full_option === arg.slice( 2 ) );
			}
			else
			{
				option = configs.find( config => config.short_option === arg.slice( 1 ) );
			}
			if ( option === undefined )
			{
				throw new Error( `script ${ script_name } don't have option ${ arg }\n
					${ usage( script_name, configs ) }` )
			}
		}
		else
		{
			if ( option === undefined )
			{
				throw new Error( `script ${ script_name } don't have default option\n
					${ usage( script_name, configs ) }` )
			}
			switch ( option.value_type )
			{
				case 'number': 
			}
		}
	}
}
export function parse_args1 (
	ns: NS,
	script_name: string,
	configs: ArgsConfig[]
): { [ key: string ]: ArgsValue }
{
	if ( script_name == '' )
	{
		throw new Error( 'empty script name' );
	}

	// 从configs建立ns.flags的输入
	let ns_schema: [ string, ArgsValueBase | string[] ][] = [];
	for ( const _config of configs )
	{
		// 临时config，仅供ns_schema使用
		const config = {
			full_option: _config.full_option ?? undefined,
			short_option: _config.short_option ?? undefined,
			default_value: _config.default_value ?? undefined,
			value_type: _config.value_type ?? 'string',
		};

		// ns.flags接受默认值为nullish变量时会出现非预期结果，因此临时设置所有默认值
		if ( config.default_value === undefined )
		{
			if ( config.value_type === 'string' ) config.default_value = '';
			else if ( config.value_type === 'number' ) config.default_value = 0;
			else if ( config.value_type === 'boolean' ) config.default_value = false;
			else config.default_value = [];
		}
		// ns.flags只能处理字符串数组，因此将所有数组转变为字符串数组
		else if ( Array.isArray(config.default_value) )
		{
			config.default_value = config.default_value.map( String );
		}

		// type assertion for ns.flags
		const check: ( value: any ) => asserts value is ArgsValueBase | string[] = value =>
		{
			if ( is_argsValueBase( value ) ) return;;
			if ( !Array.isArray( value ) )
			{
				throw new Error( `Error in parsing argument ${ _config.name }` );
			}
			value.forEach( e =>
			{
				if ( typeof e !== 'string' )
				{
					throw new Error( `Error in parsing argument ${ _config.name }` );
				}
			} );
		}
		check( config.default_value );

		// 建立ns_schema
		if ( config.short_option )
		{
			ns_schema.push( [ config.short_option, config.default_value ] );
		}
		if ( config.full_option )
		{
			ns_schema.push( [ config.full_option, config.default_value ] );
		}
	}

	// call ns.flags
	let ns_flags = ns.flags( ns_schema );

	// 解析ns_flags
	let data = {};
	for ( const config of configs )
	{
		let option: string;
		if ( config.full_option )
		{
			option = config.full_option;
		}
		else if ( config.short_option )
		{
			option = config.short_option;
		}
		else
		{
			option = '_';
		}

		let value: ArgsValue = ns_flags[ option ];

		if ( value === undefined && config.default_value === undefined )
		{
			throw new Error( `cannot find option ${ option }\n${ usage( script_name, configs ) }` );
		}
		else if ( typeof value === 'string' )
		{
			if ( config.value_type === 'number' )
			{
				value = +value;
				if ( isNaN(value) )
				{
					throw new Error( `option ${ option } must be a number, 
						but get ${ ns_flags[ option ] }\n
						${usage( script_name, configs ) }` );
				}
			}
			else if ( config.value_type === 'boolean' )
			{
				value = JSON.parse( value );
				if ( typeof value !== 'boolean' )
				{
					throw new Error( `option ${ option } must be a boolean, 
						but get ${ ns_flags[ option ] }\n
						${ usage( script_name, configs ) }` );
				}
			}
			else if ( config.value_type !== 'string' )
			{
				throw new Error( `unknown error on ${ option }: ${ value }` );
			}
		}
		else if ( Array.isArray(value) )
		{
			if ( config.value_type === 'number[]' )
			{
				value = value.map( Number );
			}
			else if ( config.value_type === 'boolean[]' )
			{
				value = value.map( Boolean );
			}
			else if ( config.value_type !== 'string[]' )
			{
				throw new Error( `unknown error on ${ option }: ${ value }` );
			}
		}
		else
		{
			throw new Error( `unknown error on ${ option }: ${ value }` );
		}

		Object.defineProperty( data, config.name, { value: value, enumerable: true } );
	}

	return data;
}